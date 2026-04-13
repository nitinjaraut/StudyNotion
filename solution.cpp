#include <bits/stdc++.h>
using namespace std;

int ask(vector<int>& v) {
    cout << "? " << v.size();
    for (int x : v) cout << " " << x;
    cout << endl;
    int res;
    cin >> res;
    if (res == -1) exit(0);
    return res;
}

int main() {
    int t;
    cin >> t;

    while (t--) {
        int n;
        cin >> n;
        int N = 2 * n + 1;

        // --- Find z (3rd occurrence) ---
        // f(m) = query prefix [1..m]
        // f(m) % 2 == m % 2  =>  z > m   (parity still aligned)
        // f(m) % 2 != m % 2  =>  z <= m  (parity broke at z)
        int lo = 1, hi = N;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            vector<int> v(mid);
            iota(v.begin(), v.end(), 1);
            int ans = ask(v);
            if (ans % 2 == mid % 2)
                lo = mid + 1;
            else
                hi = mid;
        }
        int z = lo;

        // --- Find y (2nd occurrence) ---
        // h(m) = query [1..m] ∪ {z}
        // h(m) % 2 != m % 2  =>  y > m
        // h(m) % 2 == m % 2  =>  y <= m
        lo = 1;
        hi = z - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            vector<int> v(mid);
            iota(v.begin(), v.end(), 1);
            v.push_back(z);
            int ans = ask(v);
            if (ans % 2 != mid % 2)
                lo = mid + 1;
            else
                hi = mid;
        }
        int y = lo;

        // --- Find x (1st occurrence) ---
        // g(m) = query [1..m] ∪ {y, z}
        // g(m) % 2 == m % 2  =>  x > m
        // g(m) % 2 != m % 2  =>  x <= m
        lo = 1;
        hi = y - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            vector<int> v(mid);
            iota(v.begin(), v.end(), 1);
            v.push_back(y);
            v.push_back(z);
            int ans = ask(v);
            if (ans % 2 == mid % 2)
                lo = mid + 1;
            else
                hi = mid;
        }
        int x = lo;

        cout << "! " << x << " " << y << " " << z << endl;
    }

    return 0;
}
