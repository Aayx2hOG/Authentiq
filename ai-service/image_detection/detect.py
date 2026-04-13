"""
Simple detection on custom images
"""

import gzip
import io
import os
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
        self.ai_class_index = 1

        resolved_model = self._resolve_model_path(Path(model_path))
        if not resolved_model:
            raise FileNotFoundError(f"Model checkpoint not found for path: {model_path}")

        state_dict, metadata = self._load_checkpoint(resolved_model)
        self._resolve_class_mapping(metadata)
        self.model.load_state_dict(state_dict)
        self.model.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    @staticmethod
    def _resolve_model_path(model_path: Path) -> Path | None:
        # Accept direct file path first.
        if model_path.is_file():
            return model_path

        candidates: list[Path] = []

        # Handle case where model_path is a directory (e.g., model_best.pth/).
        if model_path.is_dir():
            candidates.extend([
                model_path / "model_best.pth",
                model_path / "model_best.pth.gz",
                model_path / "model_final.pth",
            ])

        # Handle sibling compressed/alternate names.
        candidates.extend([
            model_path.with_suffix(".pth") if model_path.suffix != ".pth" else model_path,
            model_path.with_suffix(".pth.gz") if model_path.suffix != ".gz" else model_path,
            model_path.parent / "model_best.pth",
            model_path.parent / "model_best.pth.gz",
            model_path.parent / "model_final.pth",
        ])

        for candidate in candidates:
            if candidate.is_file():
                return candidate
        return None

    @staticmethod
    def _extract_state_dict(payload):
        metadata = {}
        if isinstance(payload, dict):
            for key in ("class_to_idx", "idx_to_class", "classes", "labels"):
                if key in payload:
                    metadata[key] = payload[key]
            if "state_dict" in payload and isinstance(payload["state_dict"], dict):
                return payload["state_dict"], metadata
            if "model_state_dict" in payload and isinstance(payload["model_state_dict"], dict):
                return payload["model_state_dict"], metadata
        return payload, metadata

    def _resolve_class_mapping(self, metadata: dict) -> None:
        # Allow manual override for mismatched checkpoints.
        override = os.environ.get("AI_CLASS_INDEX")
        if override is not None:
            try:
                idx = int(override)
                if idx in (0, 1):
                    self.ai_class_index = idx
                    return
            except ValueError:
                pass

        class_to_idx = metadata.get("class_to_idx")
        if isinstance(class_to_idx, dict):
            lowered = {str(k).lower(): int(v) for k, v in class_to_idx.items() if isinstance(v, int)}
            for key in ("fake", "ai", "generated", "synthetic"):
                if key in lowered and lowered[key] in (0, 1):
                    self.ai_class_index = lowered[key]
                    return

    def _load_checkpoint(self, model_path: Path):
        if model_path.suffix == ".gz":
            with gzip.open(model_path, "rb") as f:
                buffer = io.BytesIO(f.read())
            payload = torch.load(buffer, map_location=self.device)
        else:
            payload = torch.load(model_path, map_location=self.device)
        return self._extract_state_dict(payload)
    
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
            tensor_flip = torch.flip(tensor, dims=[3])
            
            with torch.no_grad():
                output = self.model(tensor)
                output_flip = self.model(tensor_flip)
                probs = (torch.softmax(output, dim=1) + torch.softmax(output_flip, dim=1)) / 2
                conf, pred = torch.max(probs, 1)
            
            pred = pred.item()
            conf = conf.item() * 100
            inference_time = time.time() - start_time
            ai_idx = self.ai_class_index
            real_idx = 1 - ai_idx
            ai_prob = probs[0][ai_idx].item() * 100
            real_prob = probs[0][real_idx].item() * 100
            
            if pred == real_idx:
                result = "✓ REAL IMAGE"
                emoji = "✓"
            else:
                result = "🤖 AI-GENERATED"
                emoji = "🤖"
            
            return {
                'emoji': emoji,
                'result': result,
                'confidence': conf,
                'real_prob': real_prob,
                'ai_prob': ai_prob,
                'inference_time': inference_time,
                'ai_class_index': ai_idx,
            }
        except Exception as e:
            print(f"❌ Error: {e}")
            return None


def main():
    print("\n" + "="*70)
    print("  🎯 DEEPFAKE DETECTION")
    print("="*70)
    
    try:
        detector = Detector('model_best.pth')
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return
    
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
