import boto3
from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

REGION = os.getenv("AWS_REGION", "eu-west-1")

ec2 = boto3.client("ec2", region_name=REGION)

@app.route("/api/metrics", methods=["GET"])
def get_metrics():
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
