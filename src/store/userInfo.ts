import {defineStore} from "pinia";

export const useUserInfo=defineStore('userInfo',{
    actions:{
        updateToken(token){
            this.userToken=token
        },
        updateExpireTime(time){
            this.expireTime = time
        },
        updateRole(role){
            this.userRole = role
        },
        updateStaffInfo(staffInfo){
            this.staffInfo = staffInfo
        }
    },
    persist:true,
    state:()=>{
        return {
            userToken:undefined,
            expireTime:undefined,
            userRole:undefined,
            staffInfo:undefined
        }
    }
})