import os
import json
import boto3
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

USE_MOCK = os.getenv("MOCK_MODE", "false").lower() == "true"
REGION = os.getenv("AWS_REGION", "eu-west-1")

if USE_MOCK:
    print(">>> RUNNING IN MOCK MODE")
else:
    print(">>> RUNNING IN AWS MODE")

if not USE_MOCK:
    ec2 = boto3.client("ec2", region_name=REGION)
    sts = boto3.client("sts", region_name=REGION)


@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    if USE_MOCK:
        with open("MockData/mock_ec2.json") as f:
            return jsonify(json.load(f))

    response = ec2.describe_instances()

    instances = []
    for reservation in response["Reservations"]:
        for inst in reservation["Instances"]:
            instances.append({
                "InstanceId": inst.get("InstanceId"),
                "Name": next(
                    (tag["Value"] for tag in inst.get("Tags", []) if tag["Key"] == "Name"),
                    "Unknown"
                ),
                "State": inst["State"]["Name"],
                "Type": inst["InstanceType"],
                "PrivateIP": inst.get("PrivateIpAddress"),
                "AZ": inst["Placement"]["AvailabilityZone"],
                "Owner": "Unknown",
                "Project": None,
                "Tenant": None
            })

    return jsonify(instances)


@app.route("/api/whoami", methods=["GET"])
def whoami():
    if USE_MOCK:
        return jsonify({
            "account": "000000000000",
            "user": "mock-user",
            "arn": "arn:aws:iam::000000000000:user/mock-user"
        })

    identity = sts.get_caller_identity()

    arn = identity["Arn"]

    # Extract username or role name from ARN
    username = arn.split("/")[-1]

    return jsonify({
        "account": identity["Account"],
        "user": username,
        "arn": arn
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
