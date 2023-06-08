import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';

describe("handleDateFilterParams", () => { 
    test('Test #1 - wrong date format', () => {
        const mockReq = {
            query: {from: '26-08-2000'},
        };
        const expectedResponse= "Invalid date";
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #2 - wrong body', () => {
        const mockReq = {
            query: {from: '2023-01-01', upTo: '2023-06-08', date: '2022-12-31'},
        };
        const expectedResponse= "Invalid attribute date in query";
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #3 - $gte', () => {
        const mockReq = {
            query: {from: '2023-01-01'},
        };
        const expectedResponse= "{date: {$gte: 2023-01-01T00:00:00.000Z}}";
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #4 - $lte', () => {
        const mockReq = {
            query: {upTo: '2023-04-01'},
        };
        const expectedResponse= "{date: {$lte: 2023-01-01T23:59:59.999Z}}";
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #5 - $gte and $lte', () => {
        const mockReq = {
            query: {from: '2023-01-01',
                upTo: '2023-04-01'},
        };
        const expectedResponse= "{date: {$gte: 2023-01-01T00:00:00.000Z, $lte: 2023-04-01T23:59:59.999Z}";
        const res = handleDateFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });
})

describe("verifyAuth", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("handleAmountFilterParams", () => { 
    test('Test #1, $gte', () => {
        const mockReq = {
            query: {min: 20},
        };
        const expectedResponse = "{amount: {$gte: 20} }";
        const res = handleAmountFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #2, $lte', () => {
        const mockReq = {
            query: {max: 20},
        };
        const expectedResponse = "{amount: {$lte: 20} }";
        const res = handleAmountFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #3, $gte and $lte', () => {
        const mockReq = {
            query: {min: 10,
                max: 20},
        };
        const expectedResponse = "{amount: {$gte: 10, $lte: 20} }";
        const res = handleAmountFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });

    test('Test #4, NaN', () => {
        const mockReq = {
            query: {min: 'abcde',
                max: 20},
        };
        const expectedResponse = "One or more parameters are not a number!";
        const res = handleAmountFilterParams(mockReq);
        expect(res).toEqual(expectedResponse);
    });
})