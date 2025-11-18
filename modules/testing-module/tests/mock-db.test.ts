import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseMock } from './index';

describe('SupabaseMock', () => {
  let mockDb: SupabaseMock;

  beforeEach(() => {
    mockDb = new SupabaseMock();
  });

  it('should mock a select query', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    mockDb.mockSuccess(mockData);

    const { data } = await mockDb.from('users').select('*');
    
    expect(mockDb.from).toHaveBeenCalledWith('users');
    expect(data).toEqual(mockData);
  });

  it('should mock a chained query with eq()', async () => {
    mockDb.mockSuccess([]);
    
    await mockDb.from('users').select('*').eq('id', 1);
    
    expect(mockDb.eq).toHaveBeenCalledWith('id', 1);
  });
});

