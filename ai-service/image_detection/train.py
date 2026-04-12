"""
Improved Deepfake Detection Model - Fresh Start
Better architecture, training, and validation
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import models, transforms
from pathlib import Path
from PIL import Image
import logging
import time
from datetime import timedelta
from tqdm import tqdm
import json
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class DeepfakeDataset(Dataset):
    """Load real vs AI-generated images"""
    
    def __init__(self, real_dir, fake_dir, transform=None):
        self.real_dir = Path(real_dir)
        self.fake_dir = Path(fake_dir)
        self.transform = transform
        
        self.images = []
        self.labels = []
        
        # Load real images (label 0)
        for img_path in self.real_dir.glob('*'):
            if img_path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'}:
                self.images.append(img_path)
                self.labels.append(0)
        
        # Load fake images (label 1)
        for img_path in self.fake_dir.glob('*'):
            if img_path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'}:
                self.images.append(img_path)
                self.labels.append(1)
        
        real_count = sum(1 for l in self.labels if l == 0)
        fake_count = len(self.labels) - real_count
        
        logger.info(f"Dataset loaded: {len(self.images)} images")
        logger.info(f"  Real images: {real_count}")
        logger.info(f"  Fake images: {fake_count}")
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]
        
        try:
            image = Image.open(img_path).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image, label
        except:
            return torch.zeros(3, 224, 224), label


class ImprovedModel(nn.Module):
    """Better model with multiple components"""
    
    def __init__(self, num_classes=2):
        super().__init__()
        
        # Use ResNet50 for better feature extraction
        self.backbone = models.resnet50(weights='DEFAULT')
        
        # Freeze early layers
        for param in list(self.backbone.parameters())[:-20]:
            param.requires_grad = False
        
        # Replace final fully connected layer
        num_features = self.backbone.fc.in_features
        
        self.backbone.fc = nn.Identity()
        
        # Enhanced classifier head
        self.classifier = nn.Sequential(
            nn.Linear(num_features, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(),
            nn.Dropout(0.4),
            
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.2),
            
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        features = self.backbone(x)
        logits = self.classifier(features)
        return logits


class Trainer:
    """Train the model with improved techniques"""
    
    def __init__(self, device=None, lr=0.001):
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = ImprovedModel().to(self.device)
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=lr, weight_decay=1e-5)
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='max', factor=0.5, patience=3
        )
        
        logger.info(f"Device: {self.device}")
        logger.info(f"Model: ResNet50 with Enhanced Classifier")
    
    def train_epoch(self, train_loader):
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for images, labels in tqdm(train_loader, desc="Training", leave=False):
            images = images.to(self.device)
            labels = labels.to(self.device)
            
            # Forward pass
            outputs = self.model(images)
            loss = self.criterion(outputs, labels)
            
            # Backward pass
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()
            
            total_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)
        
        avg_loss = total_loss / len(train_loader)
        accuracy = 100 * correct / total
        
        return avg_loss, accuracy
    
    def validate(self, val_loader):
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for images, labels in tqdm(val_loader, desc="Validating", leave=False):
                images = images.to(self.device)
                labels = labels.to(self.device)
                
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
                
                total_loss += loss.item()
                _, predicted = torch.max(outputs, 1)
                correct += (predicted == labels).sum().item()
                total += labels.size(0)
        
        avg_loss = total_loss / len(val_loader)
        accuracy = 100 * correct / total
        
        return avg_loss, accuracy
    
    def train(self, train_loader, val_loader, epochs=20):
        logger.info("\n" + "="*70)
        logger.info(f"TRAINING FOR {epochs} EPOCHS")
        logger.info("="*70)
        
        start_time = time.time()
        best_val_acc = 0
        history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
        
        for epoch in range(epochs):
            epoch_start = time.time()
            
            logger.info(f"\n{'─'*70}")
            logger.info(f"Epoch {epoch+1}/{epochs}")
            logger.info(f"{'─'*70}")
            
            # Train
            train_loss, train_acc = self.train_epoch(train_loader)
            
            # Validate
            val_loss, val_acc = self.validate(val_loader)
            
            # Store history
            history['train_loss'].append(train_loss)
            history['train_acc'].append(train_acc)
            history['val_loss'].append(val_loss)
            history['val_acc'].append(val_acc)
            
            # Learning rate scheduling
            self.scheduler.step(val_acc)
            
            # Logging
            epoch_time = time.time() - epoch_start
            elapsed = time.time() - start_time
            remaining = (elapsed / (epoch + 1)) * (epochs - epoch - 1)
            
            logger.info(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
            logger.info(f"Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.2f}%")
            logger.info(f"Time: {timedelta(seconds=int(epoch_time))} | ETA: {timedelta(seconds=int(remaining))}")
            
            # Save best model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(self.model.state_dict(), 'model_best.pth')
                logger.info(f"✓ Best model saved (Val Acc: {val_acc:.2f}%)")
        
        # Save final model
        torch.save(self.model.state_dict(), 'model_final.pth')
        
        # Save training history
        with open('training_history.json', 'w') as f:
            json.dump(history, f, indent=2)
        
        total_time = time.time() - start_time
        logger.info(f"\n{'='*70}")
        logger.info("TRAINING COMPLETE!")
        logger.info(f"Total Time: {timedelta(seconds=int(total_time))}")
        logger.info(f"Best Val Accuracy: {best_val_acc:.2f}%")
        logger.info(f"Models saved: model_best.pth, model_final.pth")
        logger.info(f"{'='*70}\n")


def main():
    """Train on full dataset"""
    
    # Define data transformations
    train_transform = transforms.Compose([
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
        transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), scale=(0.8, 1.2)),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Load dataset
    logger.info("Loading dataset...")
    dataset = DeepfakeDataset(
        'dataset/archive/real_vs_fake/real-vs-fake/train/real',
        'dataset/archive/real_vs_fake/real-vs-fake/train/fake',
        transform=train_transform
    )
    
    # Use validation set from dataset
    val_dataset = DeepfakeDataset(
        'dataset/archive/real_vs_fake/real-vs-fake/valid/real',
        'dataset/archive/real_vs_fake/real-vs-fake/valid/fake',
        transform=val_transform
    )
    
    # Create dataloaders
    train_loader = DataLoader(dataset, batch_size=64, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False, num_workers=4)
    
    # Train
    trainer = Trainer(lr=0.0005)
    trainer.train(train_loader, val_loader, epochs=30)


if __name__ == "__main__":
    main()
