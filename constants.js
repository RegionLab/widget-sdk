export default {

    orderStatus: {
        CREATED: 1,
        CAR_ASSIGNED: 2,
        CAR_ARRIVED: 3,
        IN_PROGRESS: 4,
        FINISHED: 5,
        ABORTED: 6,
        RESERVED: 7
    },

    orderStatusMap: {
        1: 'CREATED',
        2: 'CAR_ASSIGNED',
        3: 'CAR_ARRIVED',
        4: 'IN_PROGRESS',
        5: 'FINISHED',
        6: 'ABORTED',
        7: 'RESERVED'
    }
}