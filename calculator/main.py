from custom_classes import Calculator

calc = Calculator()
step1 = calc.add(10, 5)
step2 = calc.multiply(step1, 2)
result = calc.divide(step2, 3)
print(f"(10 + 5) * 2 / 3 = {result}")