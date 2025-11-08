package models

type EC2Instance struct {
	InstanceID    string  `json:"InstanceId"`
	Name          string  `json:"Name"`
	InstanceType  string  `json:"Type"`
	PublicIP      string  `json:"PublicIP"`
	PrivateIP     string  `json:"PrivateIP"`
	State         string  `json:"State"`
	OSInfo        string  `json:"OSInfo"`        
	SuggestedType string  `json:"SuggestedType"` 
	Cores         *int    `json:"Cores,omitempty"`
	Threads       *int    `json:"Threads,omitempty"`
}
