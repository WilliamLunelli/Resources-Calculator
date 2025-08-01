import json

def salvar_json(file_name, data):
    with open(file_name, 'w') as file:
        json.dump(data, file, indent=4)

def make_display_name(name):
    return ' '.join(word.capitalize() for word in name.split('_'))