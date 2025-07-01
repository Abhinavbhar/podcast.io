package routes

import (
	"backend/db"
	"context"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

type SignupRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type Video struct {
	VideoID    string `bson:"videoId"`
	Title      string `bson:"title"`
	UploadedAt int64  `bson:"uploadedAt"` // optional field
}
type User struct {
	UserID   string  `bson:"userId"`
	Username string  `bson:"username"`
	Password string  `bson:"password"`
	Videos   []Video `bson:"videos"`
}

func Signup(c *fiber.Ctx) error {
	req := new(SignupRequest)
	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request payload")
	}

	client, err := db.GetMongoClient()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "database connection error")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := client.Database("testdb").Collection("users")

	// Check if username already exists
	var existing User
	err = collection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&existing)
	if err == nil {
		return fiber.NewError(fiber.StatusConflict, "username already taken")
	}

	// Create new user with UUID
	newUser := User{
		UserID:   strings.ReplaceAll(strings.ToLower(uuid.New().String()), "-", "")[:8],
		Username: req.Username,
		Password: req.Password,
		Videos:   []Video{}, // In production, hash this!
	}

	_, err = collection.InsertOne(ctx, newUser)
	if err != nil {
		log.Println("Insert error:", err)
		return fiber.NewError(fiber.StatusInternalServerError, "could not create user")
	}

	return c.JSON(fiber.Map{
		"userId":  newUser.UserID,
		"message": "user created successfully",
	})
}
