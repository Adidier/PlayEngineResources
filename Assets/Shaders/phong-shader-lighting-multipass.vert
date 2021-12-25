#version 330

layout (location = 0) in vec3 pos;
layout (location = 1) in vec2 tex;
layout (location = 2) in vec3 norm;
layout (location = 3) in vec3 tangent;

out vec2 vertexUv;
out vec3 vertexPos;
out vec3 vertexNormal;

uniform mat4 model;
uniform mat4 projection;
uniform mat4 view;

void main()
{
	gl_Position = projection * view * model * vec4(pos, 1.0);
	
	vertexUv = tex;
	vertexPos = (model * vec4(pos, 1.0)).xyz; 
	vertexNormal = norm;
}
