local function reportFuel()
	http.post("https://turtle.drewh.net/status", "Fuel level: " .. turtle.getFuelLevel())
end

local function push()
	if turtle.detectUp() then
		turtle.digUp()
	end

	if turtle.detect() then
		turtle.dig()
	end
	turtle.forward()
end

local function main()
	print(turtle.getFuelLevel())
	turtle.select(1)
	turtle.refuel()

	local distance = 10

	for i = 1, distance, 1 do
		push()

		-- report fuel every 5 blocks
		if i % 5 == 0 then
			reportFuel()
		end
	end

	turtle.turnLeft()
	push()
	turtle.turnLeft()
	turtle.refuel()

	for i = 1, distance, 1 do
		push()
		if i % 5 == 0 then
			reportFuel()
		end
	end

	turtle.select(1)
end

main()
-- turtle.turnRight()
-- push()
-- turtle.turnRight()
-- main()

-- for i = 2, 6, 1 do
-- 	turtle.select(i)
-- 	turtle.drop()
-- end

-- turtle.turnRight()
-- turtle.push()
-- turtle.turnRight()
