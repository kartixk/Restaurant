const prisma = require("../prismaClient");
const { hashPassword, comparePassword, signToken } = require("./auth");

const registerUser = async (data) => {
    const { email, password, name, phone, role = "CUSTOMER" } = data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
        throw new Error("Email already in use");
    }

    const hashed = await hashPassword(password);

    // If role is MANAGER, set isVerified to false
    const isVerified = role === "MANAGER" ? false : true;

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name,
            phone,
            role,
            isVerified
        }
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
};

const loginUser = async (data) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (!user.isVerified) {
        throw new Error("Account pending admin approval");
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
};

module.exports = {
    registerUser,
    loginUser
};
