from simple_websocket_server import WebSocketServer, WebSocket
import json

class ChatServer(WebSocket):
    clients = []

    @classmethod
    def send_to_all_clients(cls, msg: dict, sender=None):
        online_users = [{'id': id, 'name': client.username} for id, client in enumerate(cls.clients)]
        msg['online'] = online_users
        msg_json = json.dumps(msg)
        for client in cls.clients:
            if client != sender:
                client.send_message(msg_json)
            else:
                client.send_message(json.dumps({'online': online_users}))

    def handle(self):
        msg_content = ChatServer.load_from_json(self.data)
        if not msg_content:
            return

        if msg_content['type'] == 'login':
            self.username = msg_content['username']
            msg_to_send = {
                'type': 'login',
                'body': f"{self.username} has been connected"
            }
            ChatServer.send_to_all_clients(msg_to_send, self)
        elif msg_content['type'] == 'chat':
            msg_to_send = {
                'type': 'chat',
                'body': msg_content['body']
            }
            ChatServer.send_to_all_clients(msg_to_send, self)
        elif msg_content['type'] == 'private_chat':
            recipient_id = msg_content.get('recipient')
            self.send_private_message(recipient_id, msg_content['body'])

    def send_private_message(self, recipient_id, message):
        try:
            recipient_id = int(recipient_id)
            recipient = ChatServer.clients[recipient_id]
            msg = json.dumps({'type': 'private_chat', 'body': message})
            recipient.send_message(msg)
        except (IndexError, ValueError):
            print(f"Invalid recipient ID: {recipient_id}")

    def connected(self):
        self.id = len(ChatServer.clients)
        ChatServer.clients.append(self)
        print(f"Client {self.address} connected, assigned ID: {self.id}")

    def handle_close(self):
        ChatServer.clients.remove(self)
        msg_to_send = {
            'type': 'logout',
            'body': f"{self.username} has been disconnected"
        }
        ChatServer.send_to_all_clients(msg_to_send)

    @staticmethod
    def load_from_json(anystring: str):
        try:
            return json.loads(anystring)
        except json.JSONDecodeError:
            return {}

if __name__ == '__main__':
    server = WebSocketServer('', 8000, ChatServer)
    server.serve_forever()
