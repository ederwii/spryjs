type CustomRoute = {
  verb: 'POST' | 'GET' | 'PUT' | 'DELETE';
  cb: Function;
  route: string;
  ispv?: boolean;
}

export default CustomRoute;