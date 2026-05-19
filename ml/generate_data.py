"""
Generiert synthetische Trainingsdaten fuer QuickWork Preisschaetzung.
Basiert auf realistischen Schweizer Handwerkerpreisen pro Kategorie.
"""

import json
import random
import math

random.seed(42)

CATEGORIES = {
    "Elektro": {
        "base_min": 150,
        "base_max": 2500,
        "tasks": [
            ("Steckdose installieren", "short"),
            ("Lichtschalter ersetzen", "short"),
            ("Sicherungskasten erneuern", "medium"),
            ("Elektroinstallation Badezimmer", "medium"),
            ("Komplette Neuverkabelung Wohnung", "long"),
            ("Aussenbeleuchtung montieren", "short"),
            ("Smart-Home Verkabelung", "long"),
            ("FI-Schutzschalter einbauen", "short"),
            ("Elektroherd anschliessen", "short"),
            ("Deckenlampe montieren", "short"),
            ("Elektrische Bodenheizung verlegen", "long"),
            ("Gegensprechanlage installieren", "medium"),
        ],
    },
    "Sanitaer": {
        "base_min": 200,
        "base_max": 3500,
        "tasks": [
            ("Wasserhahn ersetzen", "short"),
            ("WC austauschen", "medium"),
            ("Verstopfung beheben", "short"),
            ("Dusche einbauen", "long"),
            ("Boiler installieren", "medium"),
            ("Waschmaschinenanschluss", "short"),
            ("Badezimmer komplett sanieren", "long"),
            ("Rohrleitungen erneuern", "long"),
            ("Abfluss reparieren", "short"),
            ("Geschirrspueler anschliessen", "short"),
            ("Regenwasseranlage installieren", "long"),
            ("Heizungsventil ersetzen", "short"),
        ],
    },
    "Malerei": {
        "base_min": 100,
        "base_max": 2000,
        "tasks": [
            ("Zimmer streichen", "medium"),
            ("Fassade streichen", "long"),
            ("Decke weisseln", "short"),
            ("Tapete entfernen und streichen", "medium"),
            ("Treppenhaus streichen", "long"),
            ("Holzbalken lasieren", "medium"),
            ("Fensterrahmen lackieren", "short"),
            ("Garage streichen", "medium"),
            ("Tueren lackieren", "short"),
            ("Kinderzimmer gestalten", "medium"),
            ("Fassadenreinigung und Anstrich", "long"),
            ("Keller streichen", "short"),
        ],
    },
    "Garten": {
        "base_min": 80,
        "base_max": 2500,
        "tasks": [
            ("Rasen maehen", "short"),
            ("Hecke schneiden", "short"),
            ("Baum faellen", "medium"),
            ("Gartenweg anlegen", "long"),
            ("Zaun aufstellen", "medium"),
            ("Terrasse reinigen", "short"),
            ("Gartenhaus aufbauen", "long"),
            ("Bewasserungssystem installieren", "long"),
            ("Beet anlegen", "short"),
            ("Rasenneuanlage", "medium"),
            ("Teich anlegen", "long"),
            ("Stuetzmauer bauen", "long"),
        ],
    },
    "Reinigung": {
        "base_min": 50,
        "base_max": 1200,
        "tasks": [
            ("Wohnungsreinigung", "short"),
            ("Fenster putzen", "short"),
            ("Umzugsreinigung", "medium"),
            ("Teppichreinigung", "short"),
            ("Bueroreinigung", "medium"),
            ("Fassadenreinigung", "long"),
            ("Grundreinigung Kueche", "short"),
            ("Bauendreinigung", "long"),
            ("Jalousien reinigen", "short"),
            ("Polsterreinigung", "short"),
            ("Grosse Halle reinigen", "long"),
            ("Endreinigung nach Renovation", "medium"),
        ],
    },
    "Sonstiges": {
        "base_min": 100,
        "base_max": 2000,
        "tasks": [
            ("Moebel zusammenbauen", "short"),
            ("Umzugshilfe", "medium"),
            ("Tuer reparieren", "short"),
            ("Schloss austauschen", "short"),
            ("Regal montieren", "short"),
            ("Rolladen reparieren", "medium"),
            ("Parkett schleifen", "long"),
            ("Dachrinne reinigen", "short"),
            ("Markise montieren", "medium"),
            ("Innentuer einbauen", "medium"),
            ("Boden verlegen", "long"),
            ("Wand verputzen", "medium"),
        ],
    },
}

COMPLEXITY_MULTIPLIER = {
    "short": (0.3, 0.6),
    "medium": (0.5, 0.8),
    "long": (0.7, 1.0),
}

DESCRIPTIONS_EXTRA = [
    "",
    "Bitte um schnelle Erledigung.",
    "Altbau, Baujahr ca. 1960.",
    "Neubau, moderne Ausstattung.",
    "Muss bis Ende Monat erledigt sein.",
    "Zugang nur am Wochenende moeglich.",
    "Material wird vom Kunden gestellt.",
    "Inklusive Materialkosten bitte.",
    "Mehrere Raeume betroffen.",
    "Nur ein kleiner Bereich.",
    "Mietwohnung, Vermieter informiert.",
    "Eigentumswohnung.",
    "Einfamilienhaus.",
    "Bitte vorab besichtigen.",
]

REGIONS = [
    "Zuerich", "Bern", "Basel", "Luzern", "St. Gallen",
    "Winterthur", "Lausanne", "Biel", "Thun", "Aarau",
    "Schaffhausen", "Chur", "Frauenfeld", "Zug", "Solothurn",
]

REGION_FACTOR = {
    "Zuerich": 1.15,
    "Bern": 1.05,
    "Basel": 1.10,
    "Luzern": 1.05,
    "Zug": 1.20,
    "Lausanne": 1.10,
}


def generate_price(category_info, complexity, region):
    base_min = category_info["base_min"]
    base_max = category_info["base_max"]
    c_low, c_high = COMPLEXITY_MULTIPLIER[complexity]

    price = base_min + (base_max - base_min) * random.uniform(c_low, c_high)

    region_mult = REGION_FACTOR.get(region, 1.0)
    price *= region_mult

    noise = random.gauss(1.0, 0.1)
    price *= max(noise, 0.5)

    return round(price, 2)


def generate_description(task_title, extra):
    base = f"{task_title}."
    if extra:
        base += f" {extra}"
    return base


def main():
    data = []

    for i in range(300):
        cat_name = random.choice(list(CATEGORIES.keys()))
        cat_info = CATEGORIES[cat_name]
        task_title, complexity = random.choice(cat_info["tasks"])
        region = random.choice(REGIONS)
        extra = random.choice(DESCRIPTIONS_EXTRA)
        description = generate_description(task_title, extra)
        price = generate_price(cat_info, complexity, region)

        data.append({
            "id": i + 1,
            "title": task_title,
            "description": description,
            "category": cat_name,
            "region": region,
            "complexity": complexity,
            "description_length": len(description),
            "price": price,
        })

    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "training_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Generiert: {len(data)} Datensaetze")

    for cat_name in CATEGORIES:
        cat_prices = [d["price"] for d in data if d["category"] == cat_name]
        if cat_prices:
            print(f"  {cat_name}: CHF {min(cat_prices):.0f} - {max(cat_prices):.0f} (avg {sum(cat_prices)/len(cat_prices):.0f})")


if __name__ == "__main__":
    main()
