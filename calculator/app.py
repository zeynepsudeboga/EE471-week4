from flask import Flask, jsonify, request, send_from_directory

from custom_classes import Calculator

app = Flask(__name__, static_folder="static", static_url_path="")
calc = Calculator()

OPERATIONS = {
    "add": calc.add,
    "subtract": calc.subtract,
    "multiply": calc.multiply,
    "divide": calc.divide,
}


def is_number(value):
    # bool is a subclass of int in Python, so exclude it explicitly
    return isinstance(value, (int, float)) and not isinstance(value, bool)


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    for field in ("a", "b", "operation"):
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    a, b, operation = data["a"], data["b"], data["operation"]

    if not is_number(a) or not is_number(b):
        return jsonify({"error": "Both 'a' and 'b' must be numbers."}), 400

    if operation not in OPERATIONS:
        return jsonify({"error": f"Unknown operation: {operation}"}), 400

    try:
        result = OPERATIONS[operation](a, b)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"result": result})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
