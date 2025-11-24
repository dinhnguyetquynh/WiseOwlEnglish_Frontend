import { Box, Button, Typography } from "@mui/material";
import type { GameTypeEnum } from "../schemas/game.schema";
import Game, { type GameHandle } from "./GameComponent/Game";
import { useEffect, useRef, useState } from "react";

export default function CreateGameScreen({
    gameType,
    lessonId,
    gameId,       // <── THÊM VÀO ĐÂY
    onBack,
}: {
    gameType: GameTypeEnum;
    lessonId: number;
    gameId?: number;  // <── THÊM VÀO ĐÂY
    onBack: () => void;
}) {
    console.log("CreateGameScreen nhận props:", { gameId, gameType, lessonId });

    const gameRef = useRef<GameHandle>(null);
    useEffect(() => {
        console.log("CreateGameScreen → useEffect gameId:", gameId);
    }, [gameId]);

    console.log("CreateGameScreen MOUNTED!");
    useEffect(() => {
        return () => console.log("CreateGameScreen UNMOUNTED!");
    }, []);

    const [isGameValid, setIsGameValid] = useState(false);
    const handleSaveGame = () => {
        gameRef.current?.handleSave();   // chỉ gọi 1 lần duy nhất
    };

    const handleGameSaved = () => {
        console.log("Tạo game thành công");
        onBack();
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
                    {gameId ? "CẬP NHẬT GAME" : "LƯU GAME"}
                </Button>

            </Box>
            <Game
                ref={gameRef}
                gameType={gameType}
                lessonId={lessonId}
                gameId={gameId}
                onValidate={setIsGameValid}
                onSaved={handleGameSaved}
            />
        </Box>
    );
}
