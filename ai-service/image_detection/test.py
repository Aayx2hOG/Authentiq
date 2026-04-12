"""
Test the trained model on test set with comprehensive metrics
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from torch.utils.data import DataLoader, Dataset
from pathlib import Path
from PIL import Image
import logging
from tqdm import tqdm
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, classification_report
)
import json
import time
from datetime import timedelta

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class TestDataset(Dataset):
    """Load test images"""
    
    def __init__(self, real_dir, fake_dir, transform=None):
        self.real_dir = Path(real_dir)
        self.fake_dir = Path(fake_dir)
        self.transform = transform
        
        self.images = []
        self.labels = []
        
        for img_path in self.real_dir.glob('*'):
            if img_path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'}:
                self.images.append(img_path)
                self.labels.append(0)
        
        for img_path in self.fake_dir.glob('*'):
            if img_path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'}:
                self.images.append(img_path)
                self.labels.append(1)
    
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


class Tester:
    """Test model on test set"""
    
    def __init__(self, model_path='model_best.pth'):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = self._build_model().to(self.device)
        
        if not Path(model_path).exists():
            logger.error(f"Model not found: {model_path}")
            return
        
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        logger.info(f"Model loaded from {model_path}")
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    
    def _build_model(self):
        """Build same model as training"""
        backbone = models.resnet50(weights='DEFAULT')
        for param in list(backbone.parameters())[:-20]:
            param.requires_grad = False
        
        num_features = backbone.fc.in_features
        backbone.fc = nn.Identity()
        
        classifier = nn.Sequential(
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
            nn.Linear(256, 2)
        )
        
        model = nn.Module()
        model.backbone = backbone
        model.classifier = classifier
        
        def forward(x):
            features = model.backbone(x)
            return model.classifier(features)
        
        model.forward = forward
        return model
    
    def test(self, test_loader):
        """Test on test set"""
        logger.info("\n" + "="*70)
        logger.info("TESTING ON TEST SET")
        logger.info("="*70 + "\n")
        
        start_time = time.time()
        all_preds = []
        all_labels = []
        all_probs = []
        
        with torch.no_grad():
            for images, labels in tqdm(test_loader, desc="Testing"):
                images = images.to(self.device)
                
                outputs = self.model(images)
                probs = torch.softmax(outputs, dim=1)
                _, preds = torch.max(outputs, 1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.numpy())
                all_probs.extend(probs.cpu().numpy())
        
        test_time = time.time() - start_time
        
        all_preds = np.array(all_preds)
        all_labels = np.array(all_labels)
        all_probs = np.array(all_probs)
        
        # Calculate metrics
        accuracy = accuracy_score(all_labels, all_preds)
        precision = precision_score(all_labels, all_preds, zero_division=0)
        recall = recall_score(all_labels, all_preds, zero_division=0)
        f1 = f1_score(all_labels, all_preds, zero_division=0)
        roc_auc = roc_auc_score(all_labels, all_probs[:, 1])
        
        cm = confusion_matrix(all_labels, all_preds)
        report = classification_report(all_labels, all_preds, output_dict=True)
        
        # Display results
        logger.info(f"\n{'='*70}")
        logger.info("📊 OVERALL METRICS")
        logger.info(f"{'='*70}")
        logger.info(f"Accuracy:  {accuracy*100:.2f}%")
        logger.info(f"Precision: {precision*100:.2f}%")
        logger.info(f"Recall:    {recall*100:.2f}%")
        logger.info(f"F1-Score:  {f1*100:.2f}%")
        logger.info(f"ROC-AUC:   {roc_auc*100:.2f}%")
        
        logger.info(f"\n{'='*70}")
        logger.info("🔢 CONFUSION MATRIX")
        logger.info(f"{'='*70}")
        tn, fp, fn, tp = cm.ravel()
        logger.info(f"True Negatives:   {tn:6d}  (Real correctly identified)")
        logger.info(f"False Positives:  {fp:6d}  (Real misclassified as Fake)")
        logger.info(f"False Negatives:  {fn:6d}  (Fake misclassified as Real)")
        logger.info(f"True Positives:   {tp:6d}  (Fake correctly identified)")
        
        logger.info(f"\nMatrix:")
        logger.info(f"           Real    Fake")
        logger.info(f"Real    {tn:6d} {fp:6d}")
        logger.info(f"Fake    {fn:6d} {tp:6d}")
        
        # Save results
        results = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1': float(f1),
            'roc_auc': float(roc_auc),
            'confusion_matrix': cm.tolist(),
            'report': report,
            'test_time_seconds': test_time
        }
        
        with open('test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"\n{'='*70}")
        logger.info(f"⏱️  TESTING TIME")
        logger.info(f"{'='*70}")
        logger.info(f"Time to test {len(all_labels)} images: {timedelta(seconds=int(test_time))}")
        logger.info(f"Average per image: {(test_time/len(all_labels))*1000:.1f}ms")
        logger.info(f"✓ Results saved to test_results.json")
        logger.info("="*70 + "\n")


def main():
    """Run test"""
    test_dataset = TestDataset(
        'dataset/archive/real_vs_fake/real-vs-fake/test/real',
        'dataset/archive/real_vs_fake/real-vs-fake/test/fake',
        transform=transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    )
    
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False, num_workers=4)
    
    tester = Tester('model_best.pth')
    tester.test(test_loader)


if __name__ == "__main__":
    main()
