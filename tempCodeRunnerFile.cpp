#include <bits/stdc++.h>
using namespace std;

string multiply(string numl, string num2)
{
    if (numl[0] =='0' or num2[0]=='0')
       return "0" ;

    string sum(numl.size() + num2.size(),'0');
    for (int i=numl.size()-1;0<=i;--i)
    {
        int carry = 0;
        for (int j=num2.size()-1;0<=j;--j)
        {
            int tmp=(sum[i + j+1]-'0')+(numl[i]-'0')* (num2[j]-'0') + carry;
            sum[i+j+1]=tmp%10+'0';
            carry=tmp/10;
        }
        sum[i]+=carry;
    }
    return sum.substr(sum.find_first_not_of("0"));
}

string power(string s, int p) {

    if(p==1) return s ;
    return multiply(s,power(s,p-1)) ;
}

int main()
{   
    string n ;
    string s ;
    cin >> n ;
    cin >> s ;
    int p=stoi(n);
    cout << power(s, (p+1)/2) << endl ;

    return 0;
}