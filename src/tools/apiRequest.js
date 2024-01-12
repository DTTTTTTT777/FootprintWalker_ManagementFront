import {axiosForHuman} from "@/main";

export async function getClerkList () {
    try {
        const response = await axiosForHuman.get('/api/human_management/clerks');
        console.log(response.data);

        // 假设职员的ID和名字位于响应的content字段中
        let clerksList = response.data.map(clerk => {
            return { id: clerk.id, name: clerk.name };
        });

        console.log(clerksList);
        return clerksList;
    } catch (error) {
        console.error(error);
    }
}