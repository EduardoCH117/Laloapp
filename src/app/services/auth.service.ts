@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost/laloapi/login.php';

  constructor(private http: HttpClient) {}

  login(correo: string, password: string) {
    return this.http.post(this.apiUrl, {
      correo: correo,
      password: password
    });
  }
}   