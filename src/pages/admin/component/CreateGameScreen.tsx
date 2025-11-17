import { Box, Button, Typography } from "@mui/material";
import type { GameTypeEnum } from "../schemas/game.schema";
import Game, { type GameHandle } from "./GameComponent/Game";
import { useRef, useState } from "react";

export default function CreateGameScreen({
    gameType,
    lessonId,
    onBack,
}: {
    gameType: GameTypeEnum;
    lessonId: number;
    onBack: () => void;
}) {
    const gameRef = useRef<GameHandle>(null);

    const [isGameValid, setIsGameValid] = useState(false);
    const handleSaveGame = () => {
        gameRef.current?.handleSave();   // chỉ gọi 1 lần duy nhất
    };

    const handleGameSaved = () => {
        console.log("Tạo game thành công");
        onBack();       // hoặc gọi refetch list game tùy backstage
    };



    return (

        <Box p={3}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Button onClick={onBack} variant="outlined" size="small">
                    ← Quay lại
                </Button>

                <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ flexGrow: 1, textAlign: "center" }}
                >
                    Tạo game: {gameType.replaceAll("_", " ")}
                </Typography>

                {/* Nút LƯU GAME nằm góc phải – luôn có */}
                <Button
                    variant="outlined"
                    disabled={!isGameValid}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        px: 3,
                        fontWeight: 600,
                        bgcolor: "white",
                    }}
                    onClick={handleSaveGame}
                >
                    LƯU GAME
                </Button>
            </Box>
            <Game
                ref={gameRef}
                gameType={gameType}
                lessonId={lessonId}
                onValidate={setIsGameValid}
                onSaved={handleGameSaved}
            />

            {/* {gameType === "PICTURE_WORD_MATCHING" && (
                <Game1 gameType={gameType} onSave={handleSaveGame} />
            )}
            {gameType === "PICTURE_SENTENCE_MATCHING" && (
                <Game1 gameType={gameType} onSave={handleSaveGame} />
            )}
            {gameType === "PICTURE_WORD_WRITING" && (
                <Game1 gameType={gameType} onSave={handleSaveGame} />
            )}
            {gameType === "PICTURE4_WORD4_MATCHING" && <Typography> <Game1 gameType={gameType} onSave={handleSaveGame} /></Typography>}
            {gameType === "PRONUNCIATION" && <Typography><Game1 gameType={gameType} onSave={handleSaveGame} /></Typography>}
            {gameType === "SENTENCE_HIDDEN_WORD" && <Typography><Game1 gameType={gameType} onSave={handleSaveGame} /></Typography>}
            {gameType === "WORD_TO_SENTENCE" && <Typography><Game1 gameType={gameType} onSave={handleSaveGame} /></Typography>}
            {gameType === "SOUND_WORD_MATCHING" && <Typography><Game1 gameType={gameType} onSave={handleSaveGame} /></Typography>} */}
        </Box>
    );
}
