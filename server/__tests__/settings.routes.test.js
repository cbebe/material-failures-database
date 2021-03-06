const httpMocks = require( 'node-mocks-http' );
const routes    = require( '../routes' );
const db        = require( '../db.js' );
const helpers   = require( '../helpers.js' );

jest.mock( '../db' );

// Mock data from db.all
const dataFromAll = [{ test : 'test' }];

// Arguments for db.all
const allArg1 = `SELECT display.object_id, 
                            display.case_study, 
                            display.record, 
                            display.path, 
                            object.name
                    FROM display
                    INNER JOIN object ON display.object_id=object.object_id`;

const allArg2 = 'display';

// Request
const request = httpMocks.createRequest(
{
    method: 'GET',
    url: '/settings'
} );

it( 'sends the correct response object on GET /settings', async () =>
{
    const response = httpMocks.createResponse();

    db.all.mockResolvedValue( dataFromAll );

    await routes.settings( request, response );

    expect( response._getJSONData() ).toEqual( dataFromAll );
    expect( db.all ).toHaveBeenLastCalledWith( allArg1, allArg2 );
    expect( db.all ).toHaveBeenCalledTimes( 1 );
} );

it( 'sends the correct response object on error at GET /settings', async () =>
{
    const response = httpMocks.createResponse();
    const errorMsg = "GET /api/settings error, Error: I am the error";

    db.all.mockRejectedValue( new Error( 'I am the error' ) );

    await routes.settings( request, response );

    expect( response._getStatusCode() ).toEqual( 400 );
    expect( response._getData() ).toEqual( `"${ errorMsg }"` );
} );
