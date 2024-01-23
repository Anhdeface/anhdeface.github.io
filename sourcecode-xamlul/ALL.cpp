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
