# 🎯 Deepfake Detection - Improved Model

Trained from scratch with a better architecture and training pipeline.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the Model (From Scratch)
```bash
python train.py
```
- Uses ResNet50 backbone with enhanced classifier
- 30 epochs training
- Saves best model to `model_best.pth`
- Saves training history to `training_history.json`

### 3. Test on Test Set
```bash
python test.py
```
Shows: Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix

### 4. Test on Custom Images
```bash
python detect.py image.jpg
```
Or run interactively:
```bash
python detect.py
```

## 📊 Model Architecture

**Backbone:** ResNet50 (pre-trained on ImageNet)

**Classifier Head:**
- Linear 2048 → 1024 + BatchNorm + ReLU + Dropout(0.4)
- Linear 1024 → 512 + BatchNorm + ReLU + Dropout(0.3)
- Linear 512 → 256 + BatchNorm + ReLU + Dropout(0.2)
- Linear 256 → 2 (outputs)

## 🎓 Training Details

- **Architecture:** ResNet50 + Enhanced Classifier
- **Loss Function:** CrossEntropyLoss
- **Optimizer:** Adam (lr=0.0005, weight_decay=1e-5)
- **Scheduler:** ReduceLROnPlateau
- **Batch Size:** 64
- **Epochs:** 30
- **GPU:** CUDA if available

### Data Augmentation (Training)
- Random horizontal/vertical flip
- Random rotation (±20°)
- Color jitter
- Random affine transformation
- Gaussian blur

## 📁 Files

| File | Purpose |
|------|---------|
| `train.py` | Train model from scratch |
| `test.py` | Evaluate on test set |
| `detect.py` | Detect on custom images |
| `model_best.pth` | Best model (after training) |
| `model_final.pth` | Final model (after training) |
| `training_history.json` | Training metrics |
| `test_results.json` | Test set metrics |

## 📈 Expected Results

After training on 100K images:
- **Accuracy:** ~95-98%
- **Precision:** ~95-98%
- **Recall:** ~95-98%
- **F1-Score:** ~95-98%

## 🔧 Improvements Made

1. **Better Model:** ResNet50 instead of EfficientNet-B0
2. **Improved Classifier:** Multi-layer with batch norm and dropout
3. **Better Augmentation:** More aggressive data augmentation
4. **Learning Rate Scheduling:** Adaptive learning rate
5. **Gradient Clipping:** Prevents exploding gradients
6. **Better Validation:** Uses separate validation set
7. **Training History:** Saves metrics for analysis

## 🎯 Usage Examples

### Single Image
```bash
python detect.py ~/photo.jpg
```

### Interactive Mode
```bash
python detect.py
# Then enter image path when prompted
```

### Test Entire Set
```bash
python test.py
# Shows comprehensive metrics and confusion matrix
```

## 📝 Output Format

```
======================================================================
🤖 AI-GENERATED
======================================================================
Confidence: 94.32%

Breakdown:
  Real:        5.68%
  AI-Generated: 94.32%
======================================================================
```

## 🔍 Troubleshooting

### "Model not found"
Train first: `python train.py`

### "File not found"
Use absolute path: `python detect.py /absolute/path/image.jpg`

### Slow training
- Ensure GPU is available: `nvidia-smi`
- Reduce batch size in `train.py` if out of memory
- Reduce num_workers if system usage is high

## 📚 Dataset Structure

```
dataset/
└── archive/
    └── real_vs_fake/
        └── real-vs-fake/
            ├── train/
            │   ├── real/
            │   └── fake/
            ├── valid/
            │   ├── real/
            │   └── fake/
            └── test/
                ├── real/
                └── fake/
```

## ✅ Performance Tips

1. **First run is slower** (loads model) - subsequent runs are faster
2. **GPU usage** - Automatically uses CUDA if available
3. **Batch processing** - Multiple images processed together
4. **High quality images** - Best results on 512x512 or larger images

## 🚀 Next Steps

1. Train: `python train.py`
2. Evaluate: `python test.py`
3. Test: `python detect.py image.jpg`

---

**Start training:** `python train.py`
