---@diagnostic disable: need-check-nil

-- TODO: Get turtle name

write("Computer name?: ")
local name = read()

print("Installing computer " .. name)

-- Write the computer name to a file
pcall(fs.delete, "/computer.txt")

local file = fs.open("computer.txt", "w")
file.write(name)
file.close()

print("Done!")

pcall(fs.delete, "/startup")

shell.run("wget", "https://turtle.drewh.net/startup")

print("Done! with install")
