"""
Simple detection on custom images
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from pathlib import Path
import sys
import time

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')


class Detector:
    def __init__(self, model_path='model_best.pth'):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = self._build_model().to(self.device)
        
        if not Path(model_path).exists():
            print(f"❌ Model not found: {model_path}")
            sys.exit(1)
        
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    
    def _build_model(self):
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
    
    def predict(self, image_path):
        image_path = Path(image_path)
        
        if not image_path.exists():
            print(f"❌ File not found: {image_path}")
            return None
        
        start_time = time.time()
        
        try:
            image = Image.open(image_path).convert('RGB')
            tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                output = self.model(tensor)
                probs = torch.softmax(output, dim=1)
                conf, pred = torch.max(probs, 1)
            
            pred = pred.item()
            conf = conf.item() * 100
            inference_time = time.time() - start_time
            
            if pred == 0:
                result = "✓ REAL IMAGE"
                emoji = "✓"
            else:
                result = "🤖 AI-GENERATED"
                emoji = "🤖"
            
            return {
                'emoji': emoji,
                'result': result,
                'confidence': conf,
                'real_prob': probs[0][0].item() * 100,
                'ai_prob': probs[0][1].item() * 100,
                'inference_time': inference_time
            }
        except Exception as e:
            print(f"❌ Error: {e}")
            return None


def main():
    print("\n" + "="*70)
    print("  🎯 DEEPFAKE DETECTION")
    print("="*70)
    
    detector = Detector('model_best.pth')
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        print("\nEnter image path:")
        image_path = input("▸ ").strip()
    
    if not image_path:
        print("❌ No image provided\n")
        return
    
    print(f"\n🔍 Analyzing: {image_path}")
    result = detector.predict(image_path)
    
    if result:
        print("\n" + "="*70)
        print(f"{result['emoji']} {result['result']}")
        print("="*70)
        print(f"Confidence: {result['confidence']:.2f}%")
        print(f"\nBreakdown:")
        print(f"  Real:        {result['real_prob']:.2f}%")
        print(f"  AI-Generated: {result['ai_prob']:.2f}%")
        print(f"\n⏱️  Time: {result['inference_time']*1000:.1f}ms")
        print("="*70 + "\n")


if __name__ == "__main__":
    main()
