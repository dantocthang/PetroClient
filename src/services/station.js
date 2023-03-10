import request from "../utils/request"

export const getAllStaion = async () => {
    const res = await request.get('/station/get-all')
    if (res.data.success) return res.data.data
    return []
}

export const getAreaStaion = async (areaId) => {
    const res = await request.get(`/station/get-area-station/${areaId}`)
    if (res.data.success) return res.data.data
    return []
}

export const getStationById = async ({ stationId }) => {
    const res = await request.get(`/station/${stationId}`)
    if (res.data.success) return res.data.data
    return []
}

export const deleteImage = async ({ stationId, imagePublicId }) => {
    const res = await request.patch(`/station/${stationId}`, { imagePublicId })
    return res
}

export const addStation = async (values) => {
    const res = await request.post('/station', values)
    return res
}

export const updateStation = async (values) => {
    const res = await request.put(`/station/${values._id}`, values)
    return res
}

export async function getNotifications() {
    const res = await request.get(`/station/notify`)
    if (res.data.success) return res.data.data
    return []
}