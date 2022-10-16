import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../common/http.service';
import { AuthGuard, AUTH_EP } from './auth.guard';
import { TKN, User } from './user';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
    type = 'auth';
    form: FormGroup;
    err = '';
    authService: HttpService<any>;

    constructor(private fb:FormBuilder,  private http: HttpClient, private router: Router,
                private route: ActivatedRoute) {

        this.authService = new HttpService(http, AUTH_EP);
        this.form = this.fb.group({
            email: ['',Validators.required],
            password: ['',Validators.required],
            cpassword: ['',Validators.required]
        });
    }

    ngOnInit(): void {
        this.route.data.subscribe((data: any) => {
            this.type = data?.type? data.type:'auth'
            let query = this.route.snapshot.queryParams;
            console.log(query);
            if(this.type == 'verify' && query['token']){
                this.authService.read('', 'reg/verify', `token=${query['token']}`).subscribe({
                    next: (tkn: any) => {
                        localStorage.setItem(TKN, tkn.token);
                        //this.router.navigate(['/']);
                    },
                    error: error => console.log(error)
                });
            }
        });
    }

    login() {
        const val = this.form.value;

        if (val.email && val.password) {
            this.authService.create({email:val.email, password:val.password}, 'ses')
                .subscribe(
                    (tkn) => {
                        console.log('tkn', tkn);
                        localStorage.setItem(TKN, tkn.token);
                        this.router.navigate(['/']);
                    }
            );
            return;
        }
        this.router.navigate(['/auth']);
    }

    register(){
        const val = this.form.value;

        if (val.email && val.password && val.cpassword && val.password === val.cpassword) {
            this.authService.create({email:val.email, password:val.password}, 'reg').subscribe(
                (res) => {
                    console.log("User is registered", res);
                    this.router.navigate([res.location]);
                }
            );
        }
    }

    fpwd(){
        const val = this.form.value;
        if (val.email) {
            this.authService.update({email:val.email}, 'fpwd').subscribe(
                    () => {
                        console.log("fpwd");
                        this.router.navigate(['/auth']);
                    }
                );
        }
        this.err = 'Email is required';
        this.router.navigate(['/fpwd']);
    }
}
