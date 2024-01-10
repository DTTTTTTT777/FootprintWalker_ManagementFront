import {defineStore} from "pinia";

export const useBaseUrl = defineStore("baseUrl",{
    state:()=>{
        return {baseUrl:"http://42.192.39.198:5000"}
    }
})