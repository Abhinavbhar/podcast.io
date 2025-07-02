package routes

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

type Message struct {
	RoomID string `json:"roomId"`
	Type   string `json:"type"` // "offer", "answer", "candidate"
	Data   string `json:"data"`
}

var (
	rooms   = make(map[string][]*websocket.Conn)
	roomMux = sync.Mutex{}
)

// HandleWebSocket handles the signaling logic per client connection
func WebSocket(c *websocket.Conn) {
	defer c.Close()

	var currentRoom string

	for {
		var msg Message
		if err := c.ReadJSON(&msg); err != nil {
			break
		}

		// On first message, join room
		if currentRoom == "" {
			currentRoom = msg.RoomID
			roomMux.Lock()
			rooms[currentRoom] = append(rooms[currentRoom], c)
			roomMux.Unlock()
		}

		// Broadcast to all clients in the same room (except self)
		roomMux.Lock()
		for _, conn := range rooms[msg.RoomID] {
			if conn != c {
				conn.WriteJSON(msg)
			}
		}
		roomMux.Unlock()
	}

	// Clean up from room on disconnect
	if currentRoom != "" {
		roomMux.Lock()
		clients := rooms[currentRoom]
		for i, conn := range clients {
			if conn == c {
				rooms[currentRoom] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
		roomMux.Unlock()
	}
}
