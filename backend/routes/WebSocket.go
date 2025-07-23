package routes

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

/* ---------- message shape (exactly what the browser sends) ------------ */
type WSMessage struct {
	RoomID string          `json:"roomId"`
	Type   string          `json:"type"`           // join-room / offer / answer / ice
	Data   json.RawMessage `json:"data,omitempty"` // raw SDP or ICE blob
}

/* ---------- room registry --------------------------------------------- */
var (
	rooms   = map[string]map[*websocket.Conn]struct{}{} // room → set of sockets
	roomMux sync.Mutex
)

/* ---------- websocket handler ----------------------------------------- */
func SignalHandler(c *websocket.Conn) {
	defer c.Close()

	var roomID string

	for {
		var msg WSMessage
		if err := c.ReadJSON(&msg); err != nil {
			break // client closed
		}

		/* first message must be join-room */
		if roomID == "" {
			if msg.Type != "join-room" || msg.RoomID == "" {
				return
			}
			roomID = msg.RoomID

			roomMux.Lock()
			if rooms[roomID] == nil {
				rooms[roomID] = make(map[*websocket.Conn]struct{})
			}
			rooms[roomID][c] = struct{}{}
			roomMux.Unlock()

			log.Printf("client joined %s (%d/∞)\n", roomID, len(rooms[roomID]))

			/* notify existing peers so they re-offer */
			broadcast(roomID, c, WSMessage{RoomID: roomID, Type: "join-room"})
			continue
		}

		/* relay offer / answer / ice */
		if msg.Type == "offer" || msg.Type == "answer" || msg.Type == "ice" {
			broadcast(roomID, c, msg)
		}
	}

	/* ------- cleanup -------- */
	if roomID != "" {
		roomMux.Lock()
		delete(rooms[roomID], c)
		if len(rooms[roomID]) == 0 {
			delete(rooms, roomID)
		}
		roomMux.Unlock()
		log.Println("socket left", roomID)
	}
}

/* relay to everyone else in the room */
func broadcast(roomID string, sender *websocket.Conn, msg WSMessage) {
	roomMux.Lock()
	defer roomMux.Unlock()
	for peer := range rooms[roomID] {
		if peer != sender {
			_ = peer.WriteJSON(msg)
		}
	}
}
