# Authentiq – Fake News Detection (Model Training)

import pandas as pd
import re
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# -----------------------------
# Load Dataset
# -----------------------------
data = pd.read_csv("WELFake_Dataset.csv")

texts = data["text"].fillna("")
labels = data["label"]

# -----------------------------
# Simple Text Cleaning
# -----------------------------
def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    return text

texts = texts.apply(preprocess)

# -----------------------------
# Train-Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.2, random_state=42
)

# -----------------------------
# Convert Text → Numerical Form
# -----------------------------
vectorizer = TfidfVectorizer(max_features=4000)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# -----------------------------
# Train Model
# -----------------------------
classifier = LogisticRegression(max_iter=1500)
classifier.fit(X_train_vec, y_train)

# -----------------------------
# Evaluate
# -----------------------------
pred = classifier.predict(X_test_vec)

print("Model Accuracy:", accuracy_score(y_test, pred))

# -----------------------------
# Save Model
# -----------------------------
joblib.dump(classifier, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Training completed and model saved.")