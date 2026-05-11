class States:
    IDLE = "idle"
    LISTENING = "listening"
    THINKING = "thinking"
    SPEAKING = "speaking"
    ERROR = "error"

class Face:
    def __init__(self):
        self.state = States.IDLE

    # def draw(self,screen):
    #     for y,row in enumerate(self.tiles):
    #         for x,tile in enumerate(row):
    #             location =(x * self.size, y * self.size)
    #             image = self.tileTypes[tile].image
    #             screen.blit(image,location)
