package models

type EC2Instance struct {
	Name        string `json:"Name"`
	InstanceID  string `json:"InstanceId"`
	State       string `json:"State"`
	Type        string `json:"Type"`
	AZ          string `json:"AZ"`
	PrivateIP   string `json:"PrivateIP"`
	Project     string `json:"Project"`
	Tenant      string `json:"Tenant"`
	Owner       string `json:"Owner"`
}

