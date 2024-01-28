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
