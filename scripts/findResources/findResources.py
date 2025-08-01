import pandas as pd
from pathlib import Path

from scripts.findResources.calculate_packs import calculate_packs
from scripts.findResources.salvar_json import salvar_json, make_display_name

# Path até os arquivos de blocos
path_archives = Path('../../uploads/lithematics')

# Ler o arquivo .csv
df = pd.read_csv(path_archives / 'lista_blocos.csv')
data = []

for idx,row in df.iterrows():
    resultado = calculate_packs(quantity=row['Total'])
    name = row['Item']
    data.append({
        'id': idx,
        'name': name,
        'displayName': make_display_name(name),
        'quantity': {
        'pack': resultado[0],
        'resto': resultado[1]
        },
    })

salvar_json('lista_blocos.json', data)