const swaggerJSDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication service endpoints for register, login, logout, update and delete user',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [__filename] // using this file to hold basic paths
}

const spec = swaggerJSDoc(options)

// Add path definitions programmatically so we don't need to annotate controllers
spec.paths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                phoneNumber: { type: 'string' }
              },
              required: ['username','password','email','role','phoneNumber']
            }
          }
        }
      },
      responses: {
        '200': { description: 'User successfully created' },
        '403': { description: 'Validation error' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                password: { type: 'string' }
              },
              required: ['username','password']
            }
          }
        }
      },
      responses: {
        '200': { description: 'Successfully logged in' },
        '404': { description: 'User not found / Invalid credentials' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      responses: {
        '200': { description: 'User logged out' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/auth/update/{id}': {
    patch: {
      tags: ['Auth'],
      summary: 'Update a user by id',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { type: 'object' } }
        }
      },
      responses: {
        '200': { description: 'User updated' },
        '400': { description: 'No user ID present' },
        '404': { description: 'User not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/auth/delete': {
    delete: {
      tags: ['Auth'],
      summary: 'Delete a user by id',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'User deleted' },
        '400': { description: 'No user ID present' },
        '404': { description: 'User not found' },
        '500': { description: 'Server error' }
      }
    }
  }
}

module.exports = spec
