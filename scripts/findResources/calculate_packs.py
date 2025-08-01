def calculate_packs(quantity):
    pack = quantity // 64
    resto = quantity % 64
    return pack, resto