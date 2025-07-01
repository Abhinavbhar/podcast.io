package routes

import (
	"backend/db"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type NewVideo struct {
	UserId string `json:"userid"`
	Title  string `json:"title"`
}

func NewVide(c *fiber.Ctx) error {
	req := new(NewVideo)
	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request payload")
	}

	client, err := db.GetMongoClient()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to connect to MongoDB")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := client.Database("testdb").Collection("users")

	video := Video{
		VideoID:    strings.ReplaceAll(strings.ToLower(uuid.New().String()), "-", "")[:8],
		Title:      req.Title,
		UploadedAt: time.Now().Unix(),
	}

	filter := bson.M{"userId": req.UserId}
	update := bson.M{"$push": bson.M{"videos": video}}

	_, updateErr := collection.UpdateOne(ctx, filter, update, options.Update())
	if updateErr != nil {
		fmt.Println(updateErr)

		return fiber.NewError(fiber.StatusInternalServerError, "failed to insert video")
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "video added successfully",
		"videoId": video.VideoID,
	})
}
