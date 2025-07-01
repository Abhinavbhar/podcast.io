package routes

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var Client *minio.Client

func InitMinio(endpoint, accessKeyID, secretAccessKey string, useSSL bool) {
	var err error
	Client, err = minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("Failed to initialize MinIO client: %v", err)
	}
}

func GeneratePresignedPutURL(bucketName, objectName string, expiry time.Duration) (string, error) {
	presignedURL, err := Client.PresignedPutObject(context.Background(), bucketName, objectName, expiry)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return presignedURL.String(), nil
}
