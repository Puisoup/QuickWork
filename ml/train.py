"""
Trainiert ein Random Forest Regressionsmodell zur Preisschaetzung
und exportiert es als JSON fuer die Next.js App.
"""

import json
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder

def main():
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(script_dir, "training_data.json"), "r", encoding="utf-8") as f:
        data = json.load(f)

    categories = sorted(set(d["category"] for d in data))
    regions = sorted(set(d["region"] for d in data))
    complexities = ["short", "medium", "long"]

    cat_encoder = {c: i for i, c in enumerate(categories)}
    region_encoder = {r: i for i, r in enumerate(regions)}
    complexity_encoder = {c: i for i, c in enumerate(complexities)}

    X = []
    y = []
    for d in data:
        features = [
            cat_encoder[d["category"]],
            region_encoder[d["region"]],
            complexity_encoder[d["complexity"]],
            d["description_length"],
        ]
        X.append(features)
        y.append(d["price"])

    X = np.array(X)
    y = np.array(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Model Performance:")
    print(f"  MAE:  CHF {mae:.2f}")
    print(f"  R2:   {r2:.4f}")

    # Statt den ganzen Random Forest zu exportieren (zu gross),
    # berechnen wir Statistiken pro Kategorie + Komplexitaet
    # Das ist fuer die App praktikabler und erklaerbarer.
    stats = {}
    for cat in categories:
        stats[cat] = {}
        for comp in complexities:
            subset = [d for d in data if d["category"] == cat and d["complexity"] == comp]
            if subset:
                prices = [d["price"] for d in subset]
                stats[cat][comp] = {
                    "min": round(min(prices), 0),
                    "max": round(max(prices), 0),
                    "mean": round(sum(prices) / len(prices), 0),
                    "median": round(sorted(prices)[len(prices) // 2], 0),
                    "count": len(prices),
                }

    # Auch Gesamtstatistiken pro Kategorie (fuer einfache Vorhersage)
    category_stats = {}
    for cat in categories:
        subset = [d for d in data if d["category"] == cat]
        if subset:
            prices = [d["price"] for d in subset]
            category_stats[cat] = {
                "min": round(min(prices), 0),
                "max": round(max(prices), 0),
                "mean": round(sum(prices) / len(prices), 0),
                "median": round(sorted(prices)[len(prices) // 2], 0),
                "count": len(subset),
            }

    # Feature importances vom Random Forest
    feature_names = ["category", "region", "complexity", "description_length"]
    importances = {
        name: round(float(imp), 4)
        for name, imp in zip(feature_names, model.feature_importances_)
    }

    # Random Forest Vorhersagen pro Kategorie+Komplexitaet als Lookup
    predictions = {}
    for cat in categories:
        predictions[cat] = {}
        for comp in complexities:
            # Durchschnittliche Region und Beschreibungslaenge
            avg_desc_len = np.mean([d["description_length"] for d in data])
            mid_region = len(regions) // 2
            x_input = np.array([[
                cat_encoder[cat],
                mid_region,
                complexity_encoder[comp],
                avg_desc_len,
            ]])
            pred = model.predict(x_input)[0]
            # Auch min/max Varianten berechnen
            predictions_list = []
            for r_idx in range(len(regions)):
                for dl in [30, 60, 100, 150]:
                    x_var = np.array([[cat_encoder[cat], r_idx, complexity_encoder[comp], dl]])
                    predictions_list.append(model.predict(x_var)[0])
            predictions[cat][comp] = {
                "predicted_mean": round(pred, 0),
                "predicted_min": round(min(predictions_list), 0),
                "predicted_max": round(max(predictions_list), 0),
            }

    model_export = {
        "model_type": "RandomForestRegressor",
        "n_estimators": 100,
        "max_depth": 10,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "mae": round(mae, 2),
        "r2": round(r2, 4),
        "feature_importances": importances,
        "categories": categories,
        "regions": regions,
        "complexities": complexities,
        "category_stats": category_stats,
        "detailed_stats": stats,
        "predictions": predictions,
    }

    with open(os.path.join(script_dir, "model.json"), "w", encoding="utf-8") as f:
        json.dump(model_export, f, ensure_ascii=False, indent=2)

    print(f"\nModell exportiert nach ml/model.json")
    print(f"Feature Importances: {importances}")
    print(f"\nKategorie-Statistiken:")
    for cat, s in category_stats.items():
        print(f"  {cat}: CHF {s['min']:.0f} - {s['max']:.0f} (avg {s['mean']:.0f}, n={s['count']})")


if __name__ == "__main__":
    main()
