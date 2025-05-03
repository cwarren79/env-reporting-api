import { expect } from 'chai';
import { escapeString, sendError, extractSensorTag } from './helpers.js';
import { Response } from 'express';
import { InfluxDB } from 'influx';

describe('Helper Functions', () => {
    describe('escapeString', () => {
        it('should escape special characters in strings', () => {
            expect(escapeString('test,string')).to.equal('test\\,string');
            expect(escapeString('test"string')).to.equal('test\\"string');
            expect(escapeString('test string')).to.equal('test\\ string');
        });

        it('should handle strings without special characters', () => {
            expect(escapeString('teststring')).to.equal('teststring');
        });
    });

    describe('extractSensorTag', () => {
        it('should extract sensor ID from valid tag array', () => {
            expect(extractSensorTag(['sensor:123'])).to.equal('123');
            expect(extractSensorTag(['other:456', 'sensor:789'])).to.equal('789');
        });

        it('should throw error for invalid tag array', () => {
            expect(() => extractSensorTag([])).to.throw('sensor tag not found');
            expect(() => extractSensorTag(['invalid:123'])).to.throw('sensor tag not found');
            expect(() => extractSensorTag(['sensor:'])).to.throw('invalid sensor tag format');
        });

        it('should throw error for non-array input', () => {
            expect(() => extractSensorTag('not an array' as any)).to.throw('tags must be an array');
            expect(() => extractSensorTag({} as any)).to.throw('tags must be an array');
        });
    });

    describe('sendError', () => {
        it('should send error response with correct status and message', () => {
            const mockRes = {
                status: (code: number) => ({
                    json: (data: any) => {
                        expect(code).to.equal(400);
                        expect(data).to.deep.equal({ error: 'Test error' });
                    }
                })
            } as Response;

            sendError(mockRes, 400, 'Test error');
        });
    });
});
