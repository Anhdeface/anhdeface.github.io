//ALL CODE DOWNLOAD
// BY QuocAnh
#include<bits/stdc++.h>
using namespace std;

int main () {
int n,s=0,i,so=0,kq=0,kq1;
string k,k2;
cin>>n;
k = to_string(n);
for(i=0;i<k.size();i++){
        so = k[i] - '0';
s = s*10+so;
while(s%3==0)
    {kq = s;
    break;
}
so = 0;
}
k2 = to_string(kq);
kq1 = k.size() - k2.size();
cout<<kq1;
}
// source 2
#include <iostream>
#include <algorithm>
#include <string>

using namespace std;

int main() {
    string c = "hello";
    transform(c.begin(), c.end(), c.begin(), ::toupper);
    cout << c;
    return 0;
}
//source 3
#include<bits/stdc++.h>
using namespace std;
int _fun (int n) {
return n * n;
}
int main () {
int a,b,sum;
cin>>a>>b;
for(int i=a;i<b;i++){
    sum += _fun(i);
}
cout<<sum;
}
//source 4
#include<bits/stdc++.h>
using namespace std;
int dec (string s) {
int result=0,so=0;
for(int i=0;i<s.size();i++){
    if(s[i]>='0'&&s[i]<='9'){
        so = s[i] -'0';
        if((so%3==0)&&(so%2==0))
        result+=3;
        if (so%3!=0)
            result+=2;
         if ((so%2!=0)&&(so%3==0))
            result+=1;
         if(so==0)
            result+=4;
        so =0;
    }
}
return result;
}
int main () {
    int n;
    string code[1000];
    cin>>n;
    cin.ignore();
    for(int i=0;i<n;i++)
        getline(cin,code[i]);

    for(int j=0;j<n;j++)
        cout<<dec(code[j])<<endl;
}
// source 5
for(int i=2;i<x;i++){
    if(x%i==0)
    return false;
// source 6
#include<bits/stdc++.h>
using namespace std;
int main () {
    int a,b;
    cin>>a>>b;
    for(int i=__gcd(a,b);i>=1;i--){
        if(i!=__gcd(a,b)&&a%i==0&&b%i==0)
            {cout<<i<<endl;break;}

    }

}
// source 7
#include<bits/stdc++.h>
using namespace std;
bool check (int n){
if(n<2)
return false;
for(int i=2;i<n;i++){
    if(n%i==0)
        return false;
}
return true;
}
int main () {
    int x;
    cin>>x;
    while(true)
    {if(check(x))
        break;
        x++;}
    cout<<x;
}
//source 8
#include<bits/stdc++.h>
using namespace std;
int main () {
int n,arr[1000]{0},a[300]{0},m=0;
cin>>n;
for(int i=0;i<n;i++)
    cin>>arr[i];
sort(arr,arr+n);
for(int i=0;i<n;i++)
{
    a[arr[i]]+=1;
    m=max(m,a[arr[i]]);
}
for(int i=n;i>=0;i--){
        if(a[arr[i]]==m)
        {cout<<arr[i]<<" "<<m;break;}
}
}
//source 9
#include<bits/stdc++.h>
using namespace std;
bool _c_ (int n){
    int root = sqrt(n);
    if(root*root==n&&n%2!=0)
    return true;
    else
        return false;
}
int main () {
int n,sum=0,d=0;
cin>>n;
for(int i=1;i<=n;i++){
    if(_c_(i))
        {d++;sum+=i;}
}
cout<<d<<endl;
cout<<sum<<endl;
}
// source 10
#include<bits/stdc++.h>
using namespace std;
int _fun (int n){
string s;
s = to_string(n);
return s.size();
}

int main () {
int n,q;
cin>>n>>q;
for(int j=1;j<=10;j++){
for(int i=n;i<=q;i++)
{
    if(_fun(i*j)<2)
        cout<<"  "<<i<<"*"<<j<<"="<<i*j<<" "<<" ";
    else if(j==10)
        cout<<"  "<<i<<"*"<<j<<"="<<i*j;
    else
        cout<<"  "<<i<<"*"<<j<<"="<<i*j<<" ";


}
cout<<endl;
}
}
//source 11
