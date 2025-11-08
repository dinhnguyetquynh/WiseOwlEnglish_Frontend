import axiosClient from "./axiosClient";

export type ItemType = "VOCAB" | "SENTENCE" | "GAME_QUESTION" | "TEST_QUESTION";
export type LessonProgressReq = {
    learnerProfileId : number;
    lessonId : number;
    itemType: ItemType;
    itemRefId : number;
}

export async function markItemAsCompleted(payload: LessonProgressReq): Promise<void> {
    console.log("Đang gửi tiến độ:", payload);
    
    try {
        // API này dùng phương thức POST
        // 'payload' sẽ tự động được gửi dưới dạng JSON body
        const res = await axiosClient.post(
            `/api/lesson-progress/mark-completed`,
            payload 
        );

        // Backend trả về 200 OK (empty body), nên chúng ta không cần return res.data
        // Việc hàm chạy tới đây mà không lỗi là đã thành công.
        console.log("Da update tien do thanh cong"+res.status);
        return;

    } catch (error: any) {
        // Sử dụng lại logic bắt lỗi quen thuộc của bạn
        let message = "Cập nhật tiến độ thất bại"; // Thay đổi thông báo mặc định
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.response?.data?.error) {
            message = error.response.data.error;
        }
        throw new Error(message);
    }
}