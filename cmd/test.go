package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"Infrastructure-Dashboard/models"
)

func main() {
	// Path to mock JSON
	mockPath := "MockData/mock_ec2.json"

	// Read the JSON file
	data, err := os.ReadFile(mockPath)
	if err != nil {
		log.Fatalf("Failed to read mock data: %v", err)
	}

	// Parse JSON into EC2Instance structs
	var instances []models.EC2Instance
	if err := json.Unmarshal(data, &instances); err != nil {
		log.Fatalf("Invalid JSON format: %v", err)
	}

	// Pretty-print JSON to terminal
	out, err := json.MarshalIndent(instances, "", "  ")
	if err != nil {
		log.Fatalf("Failed to format JSON: %v", err)
	}

	fmt.Println(string(out))
}
