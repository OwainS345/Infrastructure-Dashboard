Infrastructure Dashboard – Project Overview

Client: Glu Systems

Goal:
Build a simple dashboard that shows the status and details of AWS EC2 instances in one place. The dashboard gives a quick overview of which instances are running or stopped, and lets users view more details such as instance type, owner, and performance trends.

Key Features (MVP)

View all EC2 instances in a single AWS account and region.

See key details:

-Instance name, ID, and type

-Availability zone and private IP

-Tags (Project, Tenant, Owner)

-CPU usage and disk space

-Current state (running/stopped)

-Single-instance view showing:

-Basic metadata (name, type, OS, etc.)

-Security groups and attached volumes

-7-day CPU usage chart

Data Sources

-EC2 DescribeInstances: basic instance info

-CloudWatch: CPU and network metrics

-SSM / CloudWatch Agent: disk space and patch data

Deployment

-Local: Run via CLI or a simple web UI inside Docker

AWS (optional):

-ECS Fargate – run in a serverless container managed by AWS

-EC2 – run on a virtual machine you control

Authentication

-Local prototype: no login required

-Optional: basic authentication if deployed publicly

Stretch Goals (Future Enhancements)

-Instance Management: start, stop, or reboot instances with confirmation prompts

-Security Visualization: show relationships between instances, security groups, and rules

-Multi-Account Support: access multiple AWS accounts through AWS Organizations

-Cost Insights: display instance costs by project or tenant

-Change Tracking: record instance actions (start/stop/reboot) using CloudTrail

-Topology View: visualize instance → security group → inbound connections
