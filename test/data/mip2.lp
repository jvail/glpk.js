\* Problem: mip_with_binaries *\

Minimize
 obj: - x1 - 2 x2 + 0.1 x3 + 3 x4

Subject To
 c1: + x1 + x2 <= 5
 c2: + 2 x1 - x2 >= 0
 c3: - x1 + 3 x2 >= 0
 c4: + x3 + x4 >= 0.5

Bounds
 0 <= x3 <= 1
 0 <= x4 <= 1

Generals
 x3
 x4

End
