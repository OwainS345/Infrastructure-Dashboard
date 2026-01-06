Infrastructure Dashboard – Project Overview

Client: Glu Systems

The Infrastructure Dashboard provides a simple, unified view of AWS EC2 instances, enabling teams to quickly understand instance status, performance, ownership, and configuration.

Goal

Build an easy-to-use dashboard that displays the status and details of AWS EC2 instances in one place.
The dashboard gives a clear overview of which instances are running, stopped, or terminated and allows users to inspect additional metadata and performance trends.

Key Features (MVP)
EC2 Instance Overview

Instance name, ID, and type

Availability Zone (AZ)

Private IP address

Tags:

Project

Tenant

Owner

CPU usage


Current state (running / stopped / terminated)

Single-Instance Detail View

Displays:

Basic metadata (name, type, OS, tags, etc.)

7-day CPU usage chart (CloudWatch metrics)

Data Sources

EC2 DescribeInstances — basic instance info

CloudWatch Metrics — CPU and network statistics

Deployment Options
Local Deployment

Run locally using CLI or via the included Docker environment.

-----------------------------------

How to Use the Dashboard
Mock Mode (no AWS required)

To run the dashboard using mock data:

Open docker-compose.yml

Set:

MOCK_MODE=true


This loads the pre-packaged mock EC2 dataset.

AWS Mode (live data)

To connect to a real AWS account:

Open docker-compose.yml

Set:

MOCK_MODE=false


Add AWS credentials to .env:

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=your_region


Ensure the IAM role/user has permissions:

ec2:DescribeInstances
cloudwatch:GetMetricData
ssm:DescribeInstanceInformation   (if used)

Running the Dashboard (Local)
Build & Start
docker compose up --build

Full reset + rebuild
docker compose down --volumes
docker compose up --build


Once running, open:

http://localhost:3000