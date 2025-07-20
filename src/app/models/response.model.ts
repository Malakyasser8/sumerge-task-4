export interface LoginResponseData {
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  registered?: boolean;
}

export interface TodoResponseData {
  name: string;
  createTime: string;
  updateTime: string;
  fields: {
    name: {
      stringValue: string;
    };
    priority: {
      integerValue: string;
    };
    status: {
      stringValue: string;
    };
    userId: {
      stringValue: string;
    };
  };
}

export interface LoadTodosResponseData {
  documents: TodoResponseData[];
}
