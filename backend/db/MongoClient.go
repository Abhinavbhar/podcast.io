package db

import (
	"context"
	"log"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	clientInstance    *mongo.Client
	clientInstanceErr error
	mongoOnce         sync.Once
	mongoURI          = "mongodb://localhost:27017"
	connectionTimeout = 10 * time.Second
)

// GetMongoClient returns a singleton MongoDB client
func GetMongoClient() (*mongo.Client, error) {
	mongoOnce.Do(func() {
		ctx, cancel := context.WithTimeout(context.Background(), connectionTimeout)
		defer cancel()

		clientOptions := options.Client().ApplyURI(mongoURI)
		clientInstance, clientInstanceErr = mongo.Connect(ctx, clientOptions)

		if clientInstanceErr != nil {
			log.Println("MongoDB connection error:", clientInstanceErr)
		}
	})

	return clientInstance, clientInstanceErr
}
