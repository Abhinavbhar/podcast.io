package routes

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type UploadRequest struct {
	ChunkUserID string `json:"chunkuserid"`
	VideoID     string `json:"videoid"`
	ChunkID     int    `json:"chunkid"` // changed to int
}

type UploadResponse struct {
	SignedURL string `json:"signedUrl"`
}

func UploadHandler(c *fiber.Ctx) error {
	req := new(UploadRequest)
	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request payload")
	}

	// Convert ChunkID from int to string
	chunkIDStr := strconv.Itoa(req.ChunkID)

	objectName := req.ChunkUserID + "/" + req.VideoID + "/" + chunkIDStr + ".webm"
	bucketName := "chunkupload" // replace with your bucket
	fmt.Println(objectName)

	signedURL, err := GeneratePresignedPutURL(bucketName, objectName, 15*time.Minute)
	if err != nil {
		fmt.Println(err)
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to generate signed URL")
	}

	return c.JSON(UploadResponse{SignedURL: signedURL})
}
